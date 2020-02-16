export class AnsibleConfig {
    private static executionDirectory: string = AnsibleConfig.getDefaultExecutionDirectory();

    static getDefaultExecutionDirectory(): string {
        return `${process.cwd()}/tmp`;
    }

    static setExecutionDirectory(path: string): AnsibleConfig {
        if(isRelativePath(path)) {
            AnsibleConfig.executionDirectory = `${process.cwd()}/${path}`;
        } else {
            AnsibleConfig.executionDirectory = path;
        }

        return AnsibleConfig;
    }

    static getExecutionDirectory(): string {
        return AnsibleConfig.executionDirectory;
    }

    static getKeyPath(): string {
        return 'config/keys/server-key';
    }
}

const isRelativePath = (path: string) => {
    return path[0] === "/";
};
