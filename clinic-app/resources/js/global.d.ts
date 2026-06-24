// This file provides global type definitions to bypass strict errors 
// while the project is progressively migrated to TypeScript.

declare const route: any;

declare module '@/Layouts/*' {
    const component: any;
    export default component;
}

declare module '@/Components/*' {
    const component: any;
    export default component;
}

// Removed Utils wildcard since Utils/time.ts provides its own strong types
