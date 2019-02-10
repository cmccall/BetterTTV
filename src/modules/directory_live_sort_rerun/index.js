const settings = require('../../settings');
const watcher = require('../../watcher');
const debug = require('../../utils/debug');
const $ = require('jquery');

const bannedWords = ['rerun', 'rebroadcast', 'vodcast'];
const reruns = 'Reruns'; // for future i18n

class DirectoryLiveSortRerun {
    constructor() {
        settings.add({
            id: 'sortRerunLive',
            name: 'Sort Reruns into own category on Channel Following screen',
            defaultValue: false,
            description: 'Sort Reruns into own category on Channel Following screen'
        });
        watcher.on('load.directory.live', () => this.load());
    }

    load() {
        if (settings.get('sortRerunLive') === false) return;

        const elementsToMove = [];
        let parent;
        $('body .live-channel-card').each((index, channelEl) => {
            const channel = $(channelEl);
            const rerunBadges = channel.find('.stream-type-indicator--rerun');
            if (rerunBadges.length) {
                debug.log(`Hiding channel index ${index} because of rerun badge`);
                elementsToMove.push(channelEl);
                if (!parent) parent = channel.parent().parent();
                channel.parent().detach();
            } else {
                // check the channel title for banned keywords (english only)
                const title = String(channel.find('a.tw-link > h3').attr('title'));
                for (const s of bannedWords) {
                    if (title.toLocaleLowerCase().includes(s)) {
                        debug.log(`Hiding channel ${index} due to title '${title}'`);
                        elementsToMove.push(channelEl);
                        if (!parent) parent = channel.parent().parent();
                        channel.parent().detach();
                    }
                }
            }
        });

        if (elementsToMove.length && parent) {
            // create new section
            parent.after('<div class="tw-flex-wrap tw-tower tw-tower--300 tw-tower--gutter-sm"></div>');
            parent.after(`<div class="tw-mg-b-2" id="reruns-bttv"><h4 class="tw-c-text-base tw-strong">${reruns}</h4></div>`);
            $('#reruns-bttv').after(...elementsToMove);
        }
    }
}

module.exports = new DirectoryLiveSortRerun();
