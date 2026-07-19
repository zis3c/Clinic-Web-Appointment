# Contributing to JanjiCare

First off, thank you for considering contributing to JanjiCare. It's people like you that make JanjiCare such a great tool.

## Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check if there's already an issue open for it. If not, go ahead and open one!

## Fork & create a branch

If this is something you think you can fix, then fork JanjiCare and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```sh
git checkout -b 325-add-patient-history
```

## Get the test suite running

Make sure to install dependencies and run the tests before making your changes.

```sh
composer install
npm install
php artisan test
```

## Implement your fix or feature

At this point, you're ready to make your changes. Feel free to ask for help; everyone is a beginner at first.

## Make a Pull Request

At this point, you should switch back to your master branch and make sure it's up to date with JanjiCare's master branch:

```sh
git remote add upstream git@github.com:janjicare/clinic-web-appointment-system.git
git checkout master
git pull upstream master
```

Then update your feature branch from your local copy of master, and push it!

```sh
git checkout 325-add-patient-history
git rebase master
git push --set-upstream origin 325-add-patient-history
```

Finally, go to GitHub and make a Pull Request.

## Keeping your Pull Request updated

If a maintainer asks you to "rebase" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge.

## Code formatting

Please ensure your code follows PSR-12 coding standards for PHP and standard conventions for React/TypeScript. You can run Prettier or standard tools for the JS frontend.
