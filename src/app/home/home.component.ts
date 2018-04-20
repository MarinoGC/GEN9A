import { Component, EventEmitter, ViewEncapsulation, OnInit, OnDestroy, Input, Output } from '@angular/core';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes, UploaderOptions } from 'ngx-uploader';
import { DataService } from '../services/data.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    providers: [DataService],
    encapsulation: ViewEncapsulation.Emulated
})
export class HomeComponent implements OnInit, OnDestroy {

    @Output() onUploaded = new EventEmitter<string[]>();
    @Input() sizeI;

    options: UploaderOptions;
    files: UploadFile[];
    humanizeBytes: Function;
    dragOver: boolean = true;
    uploadInput: EventEmitter<UploadInput>;

    private nrFiles: number;
    private count: number;
    private countUp: number;
    public klaar = true;
    private pictOutput: string;
    public infoConsole;

    private wait = false;

constructor(private dataService: DataService) {
        this.files = []; // local uploading files array
        this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
        this.humanizeBytes = humanizeBytes;
    }

    onUploadOutput(output: UploadOutput): void {
        console.log(output); // lets output to see what's going on in the console
        this.infoConsole = this.dataService.addSecurity(this.infoConsole.new + '<br/>' + '__________');
        this.infoConsole = this.dataService.addSecurity(this.infoConsole.new + '<br/>' + output.type);
        if (this.klaar) {
            this.infoConsole = this.dataService.addSecurity('');
        }

        switch (output['type']) {
            case 'allAddedToQueue':
                console.log(this.files);
                this.nrFiles = this.files.length;
                this.count = 0;
                this.countUp = 0;
                this.infoConsole = this.dataService.addSecurity(this.infoConsole.new + '<br/>aantal: ' + this.nrFiles.toString());
                this.startUpload();
                break;
            case 'addedToQueue':
                // add file to array when added
                this.infoConsole = this.dataService.addSecurity(this.infoConsole.new + '<br/>' + 'name: ' + output.file.name);
                this.files.push(output.file);
                break;
            case 'start':
                this.klaar = false;
                this.infoConsole = this.dataService.addSecurity(this.infoConsole.new + '<br/>' + 'name: ' + output.file.name);
                break;
            case 'uploading':
                // update current data in files array for uploading file
                if (!this.wait) {
                    this.wait = true;
                    const index = this.files.findIndex(file => file.id === output.file.id);
                    this.files[index] = output.file;
                }
                break;
            case 'done':
                this.wait = false;
                this.infoConsole = this.dataService.addSecurity(this.infoConsole.new + '<br/>' + output.file.response.melding);
                this.count++;
                if (output.file.response.status) {
                    this.countUp++;
                }
                this.pictOutput = output['file']['name'];
                this.infoConsole = this.dataService.addSecurity(this.infoConsole.new + '<br/>' + 'name: ' + output.file.name);
                this.infoConsole = this.dataService.addSecurity(this.infoConsole.new + '<br/>' + 'size: ' + Math.round(output.file.size / 1000).toString() + ' kB');
                this.infoConsole = this.dataService.addSecurity(this.infoConsole.new + '<br/>' + 'speed: ' +  output.file.progress.data.speedHuman);

                if (this.count == this.nrFiles) {
                    console.log(`====> ${this.count}  FILES UPLOADED`);
                    console.log(this.files);
                    this.infoConsole = this.dataService.addSecurity(this.infoConsole.new + '<br/>' + '__________');
                    this.infoConsole = this.dataService.addSecurity(this.infoConsole.new + '<br/>' + 'uploaded ' + this.countUp.toString() + ' files of total ' + this.count.toString());
                    this.onUploaded.emit(['FILES UPLOADED']);
                    this.files = [];
                    this.klaar = true;
                }
                break;
            case 'removed':
                // remove file from array when removed
                this.files = this.files.filter((file: UploadFile) => file !== output.file);
                break;
            default:
        }
    }

    startUpload(): void {
        const event: UploadInput = {
            type: 'uploadAll',
            url: '/upload1.php',
            method: 'POST',
            data: { foo: 'bar' }
        };
        if (!this.wait) {
            this.uploadInput.emit(event);
        }
     }

    cancelUpload(id: string): void {
        this.uploadInput.emit({ type: 'cancel', id: id });
    }

    removeFile(id: string): void {
        this.uploadInput.emit({ type: 'remove', id: id });
    }

    removeAllFiles(): void {
        this.uploadInput.emit({ type: 'removeAll' });
    }

    ngOnInit() {
        this.infoConsole = this.dataService.addSecurity('');
    }

    ngOnDestroy() {

    }
}