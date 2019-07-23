// uniquement le parse

export class ServiceSpecification {
    uuid: string;
    repositoryUrl: string;
    repositoryVersion?: string;
    path: string;
    type: ('angular'|'api-node-v1'|'default');

    constructor(spec: any = {}) {
        this.uuid = (spec.uuid || spec.id) + '';
        this.repositoryUrl = spec.repositoryUrl || spec.repository_url || spec.repo_url;
        this.repositoryVersion = spec.repositoryVersion || spec.repository_version;
        this.path = spec.path || spec.id;
        this.type = spec.type;

        if (!this.uuid || !this.repositoryUrl || !this.path) {
            throw new Error('Invalid service specification');
        }
    }
}
