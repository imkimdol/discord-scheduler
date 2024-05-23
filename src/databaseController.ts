import Database from 'better-sqlite3';
import { User } from 'discord.js';
import fs from 'fs';

export default class DatabaseController {
    private static readonly dbName = 'db.sqlite3';

    private static _instance: DatabaseController;
    private _db: Database.Database;
    
    public static get instance(): DatabaseController {
        if (!DatabaseController._instance) {
            DatabaseController._instance = new DatabaseController();
        }
        return DatabaseController._instance;
    };
    private static set instance(instance: DatabaseController) {
        DatabaseController._instance = instance;
    };

    private constructor() {
        if (!fs.existsSync(DatabaseController.dbName)) {
            this.setupDB();
        }
        this._db = new Database(DatabaseController.dbName);
    };

    private setupDB() {
        console.log('Setting up database:');
        const newDB = new Database(DatabaseController.dbName);

        try {
            console.log('> Creating USER table.');
            newDB.prepare(`
                create table USER (
                    ID text primary key
                );
            `).run();

            console.log('> Creating EVENT table.');
            newDB.prepare(`
                create table EVENT (
                    ID           text primary key,
                    NAME         text not null,
                    ORGANIZER_ID text not null,
                    CHOSEN_TIME  text,
                    foreign key (ORGANIZER_ID) references USER (ID)
                );
            `).run();

            console.log('> Creating EVENT_MEMBER table.');
            newDB.prepare(`
                create table EVENT_MEMBER (
                    EVENT_ID text,
                    USER_ID  text,
                    foreign key (EVENT_ID) references EVENT (id),
                    foreign key (USER_ID)  references USER  (id),
                    primary key (EVENT_ID, USER_ID)
                );
            `).run();

            console.log('> Creating SUGGESTED_TIME table.');
            newDB.prepare(`
                create table SUGGESTED_TIME (
                    ID           text primary key,
                    TIME         text not null,
                    SUGGESTER_ID text not null,
                    foreign key (SUGGESTER_ID) references user (ID)
                );
            `).run();
            
            console.log('> Creating VOTE table.');
            newDB.prepare(`
                create table VOTE (
                    TIME_ID text,
                    USER_ID text,
                    foreign key (TIME_ID) references SUGGESTED_TIME (ID),
                    foreign key (USER_ID) references USER (ID),
                    primary key (TIME_ID, USER_ID)
                );
            `).run();

            newDB.close();

            console.log('Done!');

        } catch (err) {
            console.log("Error occurred. Deleting database file.");

            newDB.close();
            fs.unlinkSync(DatabaseController.dbName);
            
            throw err;
        }
    }
};