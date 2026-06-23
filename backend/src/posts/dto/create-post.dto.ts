export class CreatePostDto {
  private _titulo!: string;
  public get titulo(): string {
    return this._titulo;
  }
  public set titulo(value: string) {
    this._titulo = value;
  }
  descripcion!: string;
}