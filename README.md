# GithubApp
I chose angular, angular material for the UI framework as this is the web framework I am most familiar with.
I am using RxJS to compose async code and lodash for general helper utilities

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.7.

Please follow the steps below to run the app (please install the latest version of node first).
Most of the code I wrote is in `app.component.ts` and `git-hub.service.ts`

1. Unzip and run `npm install` in the root directory(github-app)
2. Run `npm install @angular/cli -g`
3. Run `ng serve` and navigate to `http://localhost:4200/`

Tested on Windows, Chrome browser

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

# Limitations and enhancements

- Fix sorting of repos -  The repos are sorted by fork_count but since i did not have enough time to verify the link header processing, the sorting is done on the data set returned by the first page only. Need to traverse all the 'next' links of the response for the sort metric to be meaningful
- Fix the UI bug - UI shifts a little when results are displayed
- Make Date display more useful (show commit was made 'x hours/minutes' ago)
- Support pagination UI (next/previous links) to view all commits
- Show more details about commit on demand (details view)
- Better error handling. Check the HTTP error code and display appropriate error message
- Support localization
- Validate input
- Improve unit test coverage - Added some unit tests for service but would like to add more. Also need to add unit tests for component
- Test on other platforms, browsers

Testing github commit