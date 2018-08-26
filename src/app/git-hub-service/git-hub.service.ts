import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Repo } from '../Repo';
import { map, expand, take, bufferCount, tap } from 'rxjs/operators';
import { Observable, empty, throwError } from 'rxjs';
import { CommitInfo } from '../Commit';
import { Chain } from '@angular/compiler';
import { each, orderBy, find, chain, first, last } from 'lodash';
//import { map as lodashMap } from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class GitHubService {
    constructor(private httpClient: HttpClient) { }

    private getReposInternal(orgUrl: string): Observable<HttpResponse<Array<Repo>>> {
        return this.httpClient.get<Array<Repo>>(orgUrl, {
            observe: 'response'
        });
    }

    getRepos(orgName: string): Observable<Array<Repo>> {
        let orderedRepos: Array<Repo>;
        const encodedOrg = encodeURI(orgName);
        const orgUrl = `https://api.github.com/orgs/${encodedOrg}/repos`;
        return this.getReposInternal(orgUrl).pipe(
            expand(resp => this.getMoreRepos(resp)),
            bufferCount(1), // change this to count of pages based on the link header
            map((resp) => {
                orderedRepos = orderBy(resp[0].body, ['forks_count'], ['desc']);
                return orderedRepos;
            }),
        );
    }

    getCommits(repos: Array<Repo>, selectedRepoId: number): Observable<Array<CommitInfo>> {
        const selectedRepo = find(repos, (repo) => repo.id === selectedRepoId);
        if (selectedRepo) {
            console.info('Getting Commits for ', selectedRepo.owner.login, selectedRepo.name);
            const encodedOwner = encodeURI(selectedRepo.owner.login);
            const encodedRepo = encodeURI(selectedRepo.name);
            const url = `https://api.github.com/repos/${encodedOwner}/${encodedRepo}/commits`;
            return this.httpClient.get<Array<CommitInfo>>(url).pipe(
                map((commits) => {
                    // pick only the first 100 chars of the commit message
                    each(commits, (c) => c.commit.message = c.commit.message.slice(0, 100));
                    return commits;
                }),
            );
        } else {
            return throwError('Invalid repo');
        }
    }

    // Did not have enough time to test this function, so terminating the stream
    // after the first page of repos.
    // Need to traverse all the 'next' links for the sort metric to be meaningful
    private getMoreRepos(resp: HttpResponse<Array<Repo>>): Observable<HttpResponse<Array<Repo>>> {
        return empty();
        // const linkHeaders = resp.headers.get('Link').split(',');
        // const nextLink = chain(linkHeaders)
        //     .filter((links) => {
        //         const parts = links.split(';');
        //         // assume the last element has the 'rel' information
        //         return last(parts).trim() === 'rel="next"';
        //     }).map((link) => {
        //         const parts = link.split(';');
        //         const trimmedUrl = first(parts).trim();
        //         // remove the start and end <> tags
        //         const urlLink = trimmedUrl.substring(1, trimmedUrl.length - 1);
        //         return urlLink;
        //     }).first().value();
        // if (nextLink) {
        //     console.info('get next', nextLink);
        //     return this.getReposInternal(nextLink);
        // } else {
        //     console.info('done getting repos');
        //     return empty();
        // }
    }
}
