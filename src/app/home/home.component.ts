import { Component, EventEmitter, ViewEncapsulation, OnInit, OnDestroy, Input, Output } from '@angular/core';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes, UploaderOptions } from 'ngx-uploader';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class HomeComponent implements OnInit, OnDestroy {

    @Output() onUploaded = new EventEmitter<string[]>();
    @Input() sizeI;

    options: UploaderOptions;
    files: UploadFile[];
    humanizeBytes: Function;
    dragOver: boolean;
    uploadInput: EventEmitter<UploadInput>;

    private nrFiles: number;
    private count: number;
    public klaar = true;
    private pictOutput: string;

    constructor() {
        this.files = []; // local uploading files array
        this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
        this.humanizeBytes = humanizeBytes;
    }

    onUploadOutput(output: UploadOutput): void {
        console.log(output); // lets output to see what's going on in the console
        switch (output['type']) {
            case 'allAddedToQueue':
                console.log(this.files);
                this.nrFiles = this.files.length;
                this.count = 0;
                this.startUpload();
                break;
            case 'addedToQueue':
                // add file to array when added
                this.files.push(output.file);
                break;
            case 'start':
                this.klaar = false;
                break;
            case 'uploading':
                // update current data in files array for uploading file
                const index = this.files.findIndex(file => file.id === output.file.id);
                this.files[index] = output.file;
                break;
            case 'done':
                this.count++;
                if (this.count == this.nrFiles) {
                    console.log(`====> ${this.count}  FILES UPLOADED`);
                    console.log(this.files);
                    this.onUploaded.emit(['FILES UPLOADED']);
                    this.files = [];
                    this.klaar = true;
                }
                this.pictOutput = output['file']['name'];
                break;
            case 'removed':
                // remove file from array when removed
                this.files = this.files.filter((file: UploadFile) => file !== output.file);
                break;
            case 'dragOver':
                // drag over event
                this.dragOver = true;
                break;
            case 'drop':
                // on drop event
                this.dragOver = false;
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

        this.uploadInput.emit(event);
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

    }

    ngOnDestroy() {

    }
}