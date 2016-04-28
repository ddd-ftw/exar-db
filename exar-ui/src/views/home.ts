import {autoinject} from 'aurelia-framework';

import * as $ from 'jquery';

import {ExarClient} from '../exar/client';
import {Event, Query} from '../exar/model';
import {TcpMessage} from '../exar/net';

@autoinject
export class Home {
    
    connections: Connection[] = [];
    
    exarClient: ExarClient;
    
    addConnection() {
        this.connections.push(new Connection());
        setTimeout(() => $(`#tab-${this.connections.length - 1}`).tab('show'));
    }
    
    removeConnection(index) {
        this.connections.splice(index, 1);
    }
    
    constructor() {
        this.exarClient = new ExarClient();
    }
    
    activate() {
        
    }
    
    connect(connection: Connection) {
        this.exarClient.connect(connection.collection)
            .then(connected => {
                connection.connected = true;
                connection.logTcpMessage(connected);
            }, connection.onError.bind(this));
        this.exarClient.onClose(() => {
            connection.connected = false;
            connection.logMessage(`Disconnected`);
        });
    }
    
    publish(connection: Connection) {
        let event = new Event(connection.data, (connection.tags || "").split(' '));
        this.exarClient.publish(event).then(
            published => connection.logTcpMessage(published), 
            connection.onError.bind(this)
        )
    }
    
    subscribe(connection: Connection) {
        let query = new Query(false, parseInt(connection.offset), parseInt(connection.limit), connection.tag);
        this.exarClient.subscribe(query).then(
            eventStream => {
                connection.logMessage('Subscribed');
                eventStream.subscribe(
                    event => connection.logTcpMessage(event), 
                    connection.onError.bind(this),
                    () => connection.logMessage('EndOfEventStream') 
                );
            }, 
            connection.onError.bind(this)
        )
    }
    
    disconnect() {
        this.exarClient.disconnect();
    }
}

export class Connection {
    collection: string;
    
    data: string;
    tags: string;
    
    offset: string;
    limit: string;
    tag: string;
    
    connected: boolean;
    messages: string[];
    socket: TCPSocket;
    
    constructor() {
        this.collection = '';
        this.connected = false;
        this.messages = [];
        this.socket = undefined;
    }
    
    onError(error: any) {
        this.logMessage(`Error: ${error.message}`);
    }
    
    logMessage(message: string) {
        this.messages.push(message);
    }
    
    logTcpMessage(message: TcpMessage) {
        this.messages.push(message.toTabSeparatedString());
    }
    
    clearMessages() {
        this.messages = [];
    }
}