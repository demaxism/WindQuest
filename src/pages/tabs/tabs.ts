import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { Playground} from '../playground/playground';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = Playground;
  tab2Root = AboutPage;

  constructor() {

  }
}
