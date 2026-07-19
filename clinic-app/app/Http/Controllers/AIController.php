<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Schedule;
use App\Models\ChatSession;
use App\Models\ChatMessage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AIController extends Controller
{
    public function getSession(Request $request)
    {
        $user = auth()->user();
        if (!$user) return response()->json(['messages' => []]);

        $session = ChatSession::where('user_id', $user->id)->latest()->first();
        if (!$session) return response()->json(['messages' => []]);

        $messages = $session->messages()->orderBy('id', 'asc')->get()->map(function ($msg) {
            return [
                'role' => $msg->role,
                'text' => $msg->content,
            ];
        });

        return response()->json(['messages' => $messages]);
    }

    public function clearSession(Request $request)
    {
        $user = auth()->user();
        if ($user) {
            ChatSession::where('user_id', $user->id)->delete();
        }
        return response()->json(['success' => true]);
    }
    public function triage(Request $request)
    {
        return $this->handleChat($request, false);
    }

    public function guestTriage(Request $request)
    {
        return $this->handleChat($request, true);
    }

    /**
     * @param Request $request
     * @param bool $isGuest
     */
    private function handleChat(Request $request, bool $isGuest)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        if ($isGuest) {
            return response()->json([
                'success' => true,
                'message' => $this->generateGuestTriageReply($request->string('message')->toString()),
            ]);
        }

        $apiKey = \App\Models\SystemSetting::where('key', 'ai_provider_api_key')->value('value') ?? config('services.gemini.api_key');
        $baseUrl = 'https://api.deepseek.com/v1';
        $model = 'deepseek-chat';
        
        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'AI is currently offline. Please configure the AI Provider API key in the server environment.'
            ], 503);
        }

        // @phpstan-ignore-next-line
        $identity = $isGuest ? "A guest user" : "A patient or admin";
        // @phpstan-ignore-next-line
        $endRule = $isGuest 
            ? "3. End your response by encouraging them to register an account with JanjiCare." 
            : "3. End your response by reminding them to book an appointment with the recommended specialist using the JanjiCare dashboard.";

        $systemPrompt = "You are an AI medical triage assistant for JanjiCare Clinic. {$identity} will describe their symptoms or ask about the system data. 
Your job is to concisely recommend which type of medical specialist they should see, summarize data on their screen, or fetch data from the database using your provided tools.
IMPORTANT RULES: 
1. Keep your response under 3 sentences unless summarizing complex data. 
2. Do NOT diagnose the patient. 
{$endRule}
4. You now have access to system tools. If a user asks for their analytics, schedules, or doctors, USE THE TOOLS to fetch the data before answering.
5. CRITICAL: You must strictly refuse to discuss any topics unrelated to JanjiCare, medical triage, clinic appointments, or the provided page context. If asked about unrelated topics (e.g. coding, politics, recipes), politely redirect the user back to their medical needs.
6. APP NAVIGATION: You are authorized to act as a Help Desk for the JanjiCare web application. If a user asks how to navigate the app (e.g. 'how do I logout', 'where are my appointments'), guide them. For logging out specifically, tell them to click their Avatar profile menu at the bottom-left of the sidebar and select 'Log Out'.
7. RBAC ERRORS: If a tool returns an unauthorized or permission error, do NOT apologize. Confidently inform the user that this data is restricted to authenticated users or staff, and encourage them to log in or register.";

        $messages = [];
        $messages[] = [
            'role' => 'system',
            'content' => $systemPrompt
        ];
        $messages[] = [
            'role' => 'user',
            'content' => "User Message: " . strip_tags($request->message)
        ];

        $session = null;
        // @phpstan-ignore-next-line
        if (!$isGuest && auth()->check()) {
            $user = auth()->user();
            $session = ChatSession::firstOrCreate(['user_id' => $user->id]);
            $session->messages()->create([
                'role' => 'user',
                'content' => strip_tags($request->message)
            ]);
        }

        return new StreamedResponse(function () use ($apiKey, $baseUrl, $model, $messages, $session) {
            $fullResponse = '';
            try {
                $this->streamAI($apiKey, $baseUrl, $model, $messages, 0, $fullResponse);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('AI Chat Stream Exception: ' . $e->getMessage());
                echo "data: " . json_encode(['error' => 'The AI assistant is temporarily unavailable. Please try again later.']) . "\n\n";
                ob_flush();
                flush();
            }

            if ($session && !empty($fullResponse)) {
                $session->messages()->create([
                    'role' => 'ai',
                    'content' => $fullResponse
                ]);
            }
        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }

    private function generateGuestTriageReply(string $message): string
    {
        $message = strtolower($message);

        $responses = [
            ['keywords' => ['chest pain', 'shortness of breath', 'trouble breathing'], 'reply' => 'Chest pain or breathing trouble needs urgent medical care. Please go to the nearest emergency department now.'],
            ['keywords' => ['fever', 'cough', 'sore throat'], 'reply' => 'Your symptoms may fit a general medical or respiratory issue. Please book a consultation with a GP or internal medicine doctor.'],
            ['keywords' => ['rash', 'itch', 'allergy'], 'reply' => 'A skin or allergy specialist may help if the rash is severe, spreading, or not improving. If you have swelling or breathing issues, seek urgent care.'],
            ['keywords' => ['stomach', 'abdomen', 'vomit', 'diarrhea'], 'reply' => 'A general practitioner or internal medicine doctor is a good first stop for stomach or digestive symptoms.'],
            ['keywords' => ['headache', 'migraine', 'dizzy'], 'reply' => 'A general practitioner is a safe first step for headache or dizziness unless symptoms are sudden, severe, or unusual.'],
        ];

        foreach ($responses as $response) {
            foreach ($response['keywords'] as $keyword) {
                if (str_contains($message, $keyword)) {
                    return $response['reply'];
                }
            }
        }

        return 'Please register or log in so the clinic AI can provide more detailed guidance. If your symptoms feel severe or unusual, please seek urgent medical care.';
    }

    private function streamAI($apiKey, $baseUrl, $model, $messages, $depth = 0, &$fullResponse = '')
    {
        if ($depth > 3) return; // Prevent infinite loops
        
        $tools = [
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_system_analytics',
                    'description' => 'Get system analytics for the admin dashboard (e.g., total patients, active doctors, total revenue)',
                ]
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_medicine_inventory',
                    'description' => 'Get the current pharmacy medicine inventory, stock levels, and low stock warnings.',
                ]
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_recent_appointments',
                    'description' => 'Get a summary of the 5 most recent appointments.',
                ]
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_doctors_list',
                    'description' => 'Get a list of all active doctors and their specialties.',
                ]
            ]
        ];

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'tools' => $tools,
            'stream' => true,
            'temperature' => 0.2,
            'max_tokens' => 300,
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "{$baseUrl}/chat/completions");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey
        ]);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        
        $buffer = '';
        $isError = false;

        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($ch, $data) use (&$buffer, &$isError, &$fullResponse) {
            $buffer .= $data;
            
            // Extract the actual text content being streamed to save in the DB
            $lines = explode("\n", $data);
            foreach ($lines as $line) {
                if (str_starts_with($line, 'data: ') && $line !== 'data: [DONE]') {
                    $json = json_decode(substr($line, 6), true);
                    if (isset($json['choices'][0]['delta']['content'])) {
                        $fullResponse .= $json['choices'][0]['delta']['content'];
                    }
                }
            }
            
            // If the chunk contains an error JSON, it's not a valid stream. Buffer it but do not echo.
            if (strpos($buffer, '"error":') !== false && strpos($buffer, 'data:') === false) {
                $isError = true;
                return strlen($data);
            }
            
            // Check if this chunk indicates a tool call in OpenAI format
            // e.g. "tool_calls":[{"index":0,"id":"call_123"
            if (strpos($buffer, '"tool_calls"') !== false) {
                return strlen($data);
            }
            
            // If it's normal text, stream it directly to the frontend
            echo $data;
            ob_flush();
            flush();
            
            return strlen($data);
        });
        
        curl_exec($ch);
        
        if (curl_errno($ch)) {
            $errorMsg = curl_error($ch);
            curl_close($ch);
            throw new \Exception('cURL Error: ' . $errorMsg);
        }
        
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400 || $isError) {
            // Parse error JSON to extract a safe message without exposing raw response
            $safeMessage = "AI API returned HTTP {$httpCode}";
            $decoded = json_decode($buffer, true);
            if (isset($decoded['error']['message'])) {
                $safeMessage .= ': ' . $decoded['error']['message'];
            }
            throw new \Exception($safeMessage);
        }
        
        // If we buffered a tool call, parse it, execute it, and recurse
        if (strpos($buffer, '"tool_calls"') !== false) {
            // Extract the function name and tool_call ID
            preg_match('/"name":\s*"([^"]+)"/', $buffer, $nameMatches);
            preg_match('/"id":\s*"([^"]+)"/', $buffer, $idMatches);
            
            $functionName = $nameMatches[1] ?? null;
            $toolCallId = $idMatches[1] ?? 'unknown_call_id';
            
            if ($functionName) {
                $messages[] = [
                    'role' => 'assistant',
                    'content' => null,
                    'tool_calls' => [
                        [
                            'id' => $toolCallId,
                            'type' => 'function',
                            'function' => [
                                'name' => $functionName,
                                'arguments' => "{}"
                            ]
                        ]
                    ]
                ];
                
                $result = $this->executeTool($functionName);
                
                // Inject a double newline into the stream to visually separate the AI's "thinking" text from the final result
                echo "data: " . json_encode(['choices' => [['delta' => ['content' => "\n\n"]]]]) . "\n\n";
                ob_flush();
                flush();
                
                $messages[] = [
                    'role' => 'tool',
                    'tool_call_id' => $toolCallId,
                    'content' => json_encode(['result' => $result])
                ];
                
                // Recurse to generate the final text answer based on the tool result
                $this->streamAI($apiKey, $baseUrl, $model, $messages, $depth + 1, $fullResponse);
            }
        }
    }

    private function executeTool($name)
    {
        try {
            $user = auth()->user();
            $role = $user ? $user->role : 'guest';
            $userId = $user?->id;

            switch ($name) {
                case 'get_system_analytics':
                    if ($role === 'admin') {
                        return [
                            'doctors' => Doctor::count(),
                            'patients' => Patient::count(),
                            'appointments' => Appointment::count(),
                            'schedules' => Schedule::count(),
                        ];
                    } elseif ($role === 'doctor') {
                        $doctorId = $user->doctor->id ?? null;
                        return [
                            'my_appointments' => Appointment::whereHas('schedule', function($q) use ($doctorId) {
                                $q->where('doctor_id', $doctorId);
                            })->count(),
                            'my_schedules' => Schedule::where('doctor_id', $doctorId)->count(),
                        ];
                    } else {
                        \Illuminate\Support\Facades\Log::warning("AI Security: Unauthorized access attempt to get_system_analytics by user " . ($userId ?? 'guest') . " with role {$role}");
                        return ['error' => 'You do not have permission to view system analytics.'];
                    }

                case 'get_medicine_inventory':
                    if ($role === 'patient' || $role === 'guest') {
                        \Illuminate\Support\Facades\Log::warning("AI Security: Unauthorized access attempt to get_medicine_inventory by user " . ($userId ?? 'guest') . " with role {$role}");
                        return ['error' => 'You do not have permission to view the pharmacy inventory.'];
                    }
                    return \App\Models\Medication::all(['name', 'stock_quantity', 'low_stock_threshold', 'price'])->toArray();

                case 'get_recent_appointments':
                    $query = Appointment::with(['patient.user', 'schedule.doctor.user'])->latest()->take(5);
                    
                    if ($role === 'doctor') {
                        $doctorId = $user->doctor->id ?? null;
                        $query->whereHas('schedule', function($q) use ($doctorId) {
                            $q->where('doctor_id', $doctorId);
                        });
                    } elseif ($role === 'patient') {
                        $patientId = $user->patient->id ?? null;
                        $query->where('patient_id', $patientId);
                    } elseif ($role !== 'admin') {
                        \Illuminate\Support\Facades\Log::warning("AI Security: Unauthorized access attempt to get_recent_appointments by unauthenticated user");
                        return ['error' => 'Please login to view your appointments.'];
                    }

                    $appointments = $query->get()->map(function($app) {
                        return [
                            'date' => $app->appointment_date,
                            'status' => $app->status,
                            'patient' => $app->patient->user->name ?? 'Unknown',
                            'doctor' => $app->schedule->doctor->user->name ?? 'Unknown',
                        ];
                    });
                    return ['appointments' => $appointments->toArray()];

                case 'get_doctors_list':
                    $doctors = Doctor::with('user')->get()->map(function($doc) {
                        return [
                            'name' => $doc->user->name ?? 'Unknown',
                            'specialty' => $doc->specialization ?? 'General',
                        ];
                    });
                    return ['doctors' => $doctors->toArray()];
                    
                default:
                    return ['error' => 'Unknown function'];
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('AI Tool execution error: ' . $e->getMessage(), [
                'tool' => $name,
                'user_id' => auth()->id(),
            ]);
            return ['error' => 'An internal error occurred while processing your request. The technical team has been notified.'];
        }
    }
}
