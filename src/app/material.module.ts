import { NgModule } from "@angular/core";
import { CdkTableModule } from '@angular/cdk/table';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';

@NgModule({
    exports: [
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule
    ]
})
export class MaterialModule { }