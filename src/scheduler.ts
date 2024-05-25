import { User } from 'discord.js';
import SchedulerEvent from './model/event';
import UserWrapper from './model/userWrapper';

export default class Scheduler {
    private static _instance: Scheduler;
    private events: { [key: string]: SchedulerEvent };
    private users: { [key: string]: UserWrapper };

    public static get instance(): Scheduler {
        if (!Scheduler._instance) {
            Scheduler._instance = new Scheduler();
        }
        return Scheduler._instance;
    };
    private static set instance(instance: Scheduler) {
        Scheduler._instance = instance;
    };

    private constructor() {
        this.events = {};
        this.users = {};
    };

    addEvent(event: SchedulerEvent): void {
        this.events[event.id] = event;
    };
    removeEvent(event: SchedulerEvent): void {
        delete this.events[event.id];
    };
    getEvent(event: SchedulerEvent): SchedulerEvent {
        return this.events[event.id];
    };
    addUser(user: UserWrapper): void {
        this.users[user.id] = user;
    };
    getUser(user: User): UserWrapper {
        let userWrapper = this.users[user.id];

        if (!userWrapper) {
            userWrapper = new UserWrapper(user);
            this.addUser(userWrapper);
        }

        return userWrapper;
    };
};