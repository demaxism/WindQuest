import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ViewController } from 'ionic-angular';
import { first } from 'rxjs/operators';

import { AlertService, AuthUserService } from '../_services';

@Component({
    selector: 'register',
    templateUrl: 'register.component.html'
})
export class RegisterComponent {
    registerForm: FormGroup;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        private authUserService: AuthUserService,
        private alertService: AlertService) { }

    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            desc1: ['', Validators.required],
            desc2: ['', Validators.required],
            username: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    /* LIFECYCLE */
    ngAfterViewInit() {
        
    }

    // convenience getter for easy access to form fields
    get f() { return this.registerForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }

        this.loading = true;
        this.authUserService.register(this.registerForm.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Registration successful', true);
                    //this.router.navigate(['/login']);
                    window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: "Login"}));
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}
