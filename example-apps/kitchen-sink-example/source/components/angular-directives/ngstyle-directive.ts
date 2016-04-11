import {Component} from 'angular2/core';

@Component({
 selector: 'ngstyle-directive',
 template: `
   <h1 [ngStyle]="{
      'font-style': style,
      'font-size': size,
      'font-weight': weight,
      'background-color': color
    }" style="color: white;">
     Change style of this text!
   </h1>

   <hr>
   <label>Italic: <input type="checkbox" (change)="changeStyle($event)"></label>
   <label>Bold: <input type="checkbox" (change)="changeWeight($event)"></label>
   <label>Size: <input type="text" [value]="size"
   (change)="size = $event.target.value"></label>
   <label>Background: <input type="text" [value]="color"
   (change)="color = $event.target.value"></label>
 `
})
export default class NgStyleDirective {
   style = 'normal';
   weight = 'normal';
   size = '30px';
   color = 'black';

   changeStyle($event: any) {
     this.style = $event.target.checked ? 'italic' : 'normal';
   }

   changeWeight($event: any) {
     this.weight = $event.target.checked ? 'bold' : 'normal';
   }
}
