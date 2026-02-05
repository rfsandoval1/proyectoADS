export class Password {
  constructor(
    public readonly value: string,
    public readonly isHashed: boolean = false
  ) {}
}
