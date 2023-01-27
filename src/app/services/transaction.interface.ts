import { Subscription } from "rxjs";

export interface transaction {
    date: string;
    category: string;
    account: string;
    amount: number;
    notes: string;
}

export interface category {
    name: string;
    color: string;
}

export class subscriptionContainer {
    private subscriptions : Subscription[] = [];

    set add(sub: Subscription) {
        this.subscriptions.push(sub);
    }

    unsubscribe() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }
}

export interface ui_info {
    weekDay: number;
    isCurrentDate: boolean;
    weekRange: string[];
}

export function reduceTransaction(accumulator: number, tr: transaction) {
    return accumulator + tr["amount"];
}

export function compareTransaction(a : transaction, b : transaction) {
    if (a["date"] > b["date"]) {
        return 1;
    }

    if (a["date"] < b["date"]) {
        return -1;
    }
    return 0;
}

export function filterTransaction(
    transactionList: transaction[],
    account: string[] = [],
    category: string[] = [], 
    untilDate: string, 
    fromDate: string = "0000-00-00") {

    return transactionList.filter( (tr) => {
        if (tr["date"] < fromDate) {
            return false;
        }
        if (tr["date"] > untilDate) {
            return false;
        }
        if (category.length && !category.includes(tr["category"])) {
            return false;
        }
        if (account.length && !account.includes(tr["account"])) {
            return false;
        }
        return true;
    });
}
