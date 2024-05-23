import SchedulerEvent from './model/event';

export default class Scheduler {
    private static _instance: Scheduler;
    private events: { [key: string]: SchedulerEvent };

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
};