// uniquement le parse

export class ServiceSpecification {
    uuid: string;
    repository: {
        url: string,
        version?: string
    };
    path: string;
    type: ('angular'|'api-node-v1'|'default');
}
