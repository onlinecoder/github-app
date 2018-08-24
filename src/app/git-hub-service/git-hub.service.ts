import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Repo } from '../Repo';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { find, orderBy, first, each } from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class GitHubService {

    constructor(private httpClient: HttpClient) { }

    getRepos(orgName: string): Observable<Array<Repo>> {
        let orderedRepos: Array<Repo>;
        return this.httpClient.get<Array<Repo>>(`https://api.github.com/orgs/${orgName}/repos`, {
            // this.httpClient.get<Array<Repo>>('https://api.github.com/organizations/913567/repos?page=5', {
            observe: 'response'
        }).pipe(
            map((repos) => {
                orderedRepos = orderBy(repos.body, ['forks'], ['desc']);
                return orderedRepos;
            }),
        );
    }

    getCommits(repos: Array<Repo>, selectedRepoId: number): Observable<Array<Commit>> {
        const selectedRepo = find(repos, (repo) => repo.id === selectedRepoId);
        console.info('Getting COMMITS', selectedRepo.owner.login, selectedRepo.name);
        const url = `https://api.github.com/repos/${selectedRepo.owner.login}/${selectedRepo.name}/commits`;
        return this.httpClient.get<Array<Commit>>(url).pipe(
            map((commits) => {
                each(commits, (c) => {
                    // pick only the first 100 chars
                    c.commit.message = c.commit.message.slice(0, 100);
                });
                return commits;
            }),
        );
    }
}
