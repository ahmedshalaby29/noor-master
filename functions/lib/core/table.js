"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
class Table {
    $(selector, context) {
        return this.root(selector, context || this.table);
    }
    constructor(html, id) {
        this.root = (0, cheerio_1.load)(html);
        if (id) {
            this.table = this.root(`div[id='${id}']`);
        }
        else {
            this.table = this.root("table");
        }
    }
    lines() {
        const lines = [];
        let firstLine;
        this.$("tbody > tr").each((i, e) => {
            const elm = this.root(e);
            if (i == 0) {
                firstLine = this.processFirstLine(elm);
                return;
            }
            if (!this.filter(elm))
                return;
            const id = elm.attr("id");
            lines.push(Object.assign({ id }, this.processLine(elm, firstLine)));
        });
        return lines;
    }
    processFirstLine(tr) {
        return undefined;
    }
}
exports.default = Table;
//# sourceMappingURL=table.js.map