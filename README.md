# GithubApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.7.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

# Further enhancements

- Make Date display more useful (show commit was made 'x hours/minutes' ago)
- Support pagination for commits
- Show more details about commit on demand
- Better error handling. Check the HTTP error code and display error message
- Support localization
- Validate input
- Fix sorting of repos - Currently support sorting the repos by fork_count but since i did not have enough time to verify the link header processing, the current       sorting is based on data from the first page only. Need to traverse all the 'next' links of the response for the sort metric to be meaningful
- Improve test coverage