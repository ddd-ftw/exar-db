import {Event, Query} from './model';
import {Connect, Connected, Publish, Published, Subscribe, Subscribed, TcpMessage} from './net';

export class ExarClient {
    
    private socket: TCPSocket;
    
    private encoder: TextEncoding.TextEncoder;
    private decoder: TextEncoding.TextDecoder;
    
    constructor() {
        this.encoder = new TextEncoder("utf8");
        this.decoder = new TextDecoder("utf8");
    }
    
    private encode(data: string): ArrayBufferView {
        return this.encoder.encode(data);
    }
    
    private decode(data: ArrayBufferView): string {
        return this.decoder.decode(data);
    }
    
    private send(message: TcpMessage) {
        this.socket.send(this.encode(message.toTabSeparatedString()));
    }
    
    connect(collection: string) {
        return new Promise<Connected>((resolve, reject) => {
            this.socket = navigator.TCPSocket.open("localhost", 38580);
            this.socket.onopen = () => this.send(new Connect(collection, 'admin', 'secret'));
            this.socket.ondata = event => resolve(Connected.fromTabSeparatedString(this.decode(event.data)));
            this.socket.onerror = error => reject(error.data);
        })
    }
    
    onClose(onClose: () => any) {
        this.socket.onclose = onClose;
    }
    
    disconnect() {
        this.socket.close();
    }
    
    publish(event: Event) {
        return new Promise<Published>((resolve, reject) => {
            this.socket.ondata = event => resolve(Published.fromTabSeparatedString(this.decode(event.data)));
            this.socket.onerror = error => reject(error.data);
            this.send(new Publish(event));
        });
    }
    
    subscribe(query: Query, onEvent: (e?: Event) => any) {
        return new Promise<Subscribed>((resolve, reject) => {
            this.socket.ondata = subscribed => {
                resolve(Subscribed.fromTabSeparatedString(this.decode(subscribed.data)));
                this.socket.ondata = event => {
                    let events = this.decode(event.data).split('\n');
                    for(event of events) {
                        if(event === 'EndOfEventStream') onEvent();
                        else if(event) onEvent(Event.fromTabSeparatedString(event));
                    }
                };
            };
            
            this.socket.onerror = error => reject(error.data);
            
            this.send(new Subscribe(query));
        });
    }
    
}