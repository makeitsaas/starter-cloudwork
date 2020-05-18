export interface AnsibleStepInterface {
    type: string
    label: string
    lines: string[]
    status: string
    data: any
}

export interface ParsedAnsibleOutputInterface {
    success: boolean
    steps: AnsibleStepInterface[]
    recap: {[key: string]: number}
}
