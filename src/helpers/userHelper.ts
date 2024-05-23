export default class UserHelper {
    static readonly mentionRegex: RegExp = /<@\d+>/;
    static toMention(id: string): string {
        return '<@' + id + '>';
    };
};