export class DialogControl {
  public okAction:Function; // dialog call parent
  public cancelAction:Function;
  public parent:any;
  public show:Function; // parent call dialog
  public hide:Function;
}