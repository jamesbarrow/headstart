// angular
import { Component, OnInit, Inject } from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { CurrentUserService } from '@app-seller/shared/services/current-user/current-user.service'
import { applicationConfiguration } from '@app-seller/config/app.config'
import { ToastrService } from 'ngx-toastr'
import { AppConfig } from '@app-seller/models/environment.types'
//import 'rxjs/add/operator/filter';

@Component({
  selector: 'auth-login',
  templateUrl: './sso.component.html',
  styleUrls: ['./sso.component.scss'],
})
export class SSOComponent implements OnInit {

  constructor(
    private currentUserService: CurrentUserService,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: ToastrService,
    @Inject(applicationConfiguration) private appConfig: AppConfig
  ) {}

  ngOnInit() {
    // this.form = this.formBuilder.group({
    //   username: '',
    //   password: '',
    //   rememberMe: false,
    // })
    console.log('sso');

    


    try {
      var token = this.route.snapshot.queryParams['token']
      if(token){
        (async () => {
          console.log('query params', token)
          await this.currentUserService.ssologin(token)
          this.router.navigateByUrl('/home')
        })();
      }
      
      //this.route.queryParams
        //.filter(params => params.token)
        //.subscribe(params => {
          //console.log(params); // { category: "fiction" }
          //this.currentUserService.ssologin(params.token)
          //console.log(params.token); // fiction
          //console.log(params.test); // fiction
        //}
      //);

      
    } catch {
      this.toasterService.error('Invalid Login Credentials')
    }
    this.router.navigateByUrl('/login')
  }


}
