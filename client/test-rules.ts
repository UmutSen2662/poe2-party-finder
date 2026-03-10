import markdown from 'discord-markdown';
import SimpleMarkdown from 'simple-markdown';

const customRules = {
  ...markdown.rules,
  heading: Object.assign({}, SimpleMarkdown.defaultRules.heading, {
    match: SimpleMarkdown.blockRegex(/^ *(#{1,3}) +([^\n]+?) *(?:\n *)+/)
  }),
  list: SimpleMarkdown.defaultRules.list,
  timestamp: {
    order: markdown.rules.text.order - 1,
    match: SimpleMarkdown.inlineRegex(/^<t:(\d+)(?::([tTdDfFR]))?>/),
    parse: function(capture: any) {
      return { timestamp: capture[1], format: capture[2] || 'f' };
    },
    html: function(node: any) {
      return '<span class="d-timestamp" data-timestamp="' + node.timestamp + '" data-format="' + node.format + '">' + new Date(node.timestamp * 1000).toLocaleString() + '</span>';
    }
  }
};

const parse = SimpleMarkdown.parserFor(customRules);
const htmlOutput = SimpleMarkdown.outputFor(customRules, 'html');

function customToHTML(source: string) {
  const state = { inline: false, inQuote: false };
  return htmlOutput(parse(source + '\n\n', state));
}

const text = "Hello\n# H1 Header\n<t:1735700400:R> time!";
console.log(customToHTML(text));
