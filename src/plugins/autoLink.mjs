import path from 'node:path';

// Core topic and pillar article keyword-to-URL lookup map
const KEYWORD_MAP = [
  { keyword: 'Opening Night Live', url: '/article/gamescom-2026-opening-night-live-schedule-announcements' },
  { keyword: 'Unreal Engine 5', url: '/article/best-unreal-engine-5-pc-graphics-settings-fps-guide' },
  { keyword: 'Gamescom 2026', url: '/article/gamescom-2026-schedule-lineup-playable-games' },
  { keyword: 'Xbox at Gamescom', url: '/article/xbox-gamescom-2026-lineup-broadcast-schedule-playable-games' },
  { keyword: 'Xbox Game Pass', url: '/article/xbox-game-pass-late-august-2026-wave-2-lineup-schedule' },
  { keyword: 'The Sinking City 2', url: '/article/the-sinking-city-2-review-unreal-engine-5-survival-horror' },
  { keyword: 'Blood of Dawnwalker', url: '/article/the-blood-of-dawnwalker-witcher-veterans-gameplay-mechanics-ue5' },
  { keyword: 'Star Wars Zero Company', url: '/article/star-wars-zero-company-gameplay-turn-based-combat-breakdown' },
  { keyword: '1440p gaming monitors', url: '/article/best-budget-1440p-gaming-monitors-under-250' },
  { keyword: 'Oblivion Remastered', url: '/article/oblivion-remastered-review' },
  { keyword: 'Beast of Reincarnation', url: '/article/beast-of-reincarnation-review' },
  { keyword: 'Grand Theft Auto VI', url: '/article/gta-vi-extended-gameplay-breakdown' },
  { keyword: 'Hell Let Loose', url: '/article/hell-let-loose-vietnam-review' },
  { keyword: 'Ghost of Yotei', url: '/article/ghost-of-yotei-review' },
  { keyword: 'Mortal Shell 2', url: '/article/mortal-shell-2-review' },
  { keyword: 'Marvel Tokon', url: '/article/marvel-tokon-review' },
  { keyword: 'PS Plus Extra', url: '/article/ps-plus-extra-premium-august-2026-lineup-download-sizes' },
  { keyword: 'PlayStation Plus', url: '/article/ps-plus-extra-premium-august-2026-lineup-download-sizes' },
  { keyword: 'Geoff Keighley', url: '/article/gamescom-2026-opening-night-live-schedule-announcements' },
  { keyword: 'GTA 6 Pre-Orders', url: '/article/gta-6-preorder-revenue-400-million-milestone-breakdown' },
  { keyword: 'S.T.A.L.K.E.R. 2', url: '/article/stalker2-review' },
  { keyword: 'STALKER 2', url: '/article/stalker2-review' },
  { keyword: 'GTA VI', url: '/article/gta-vi-extended-gameplay-breakdown' },
  { keyword: 'GTA 6', url: '/article/gta-6-preorder-revenue-400-million-milestone-breakdown' },
  { keyword: '1440p', url: '/article/best-budget-1440p-gaming-monitors-under-250' },
  { keyword: 'DLSS', url: '/article/best-unreal-engine-5-pc-graphics-settings-fps-guide' },
  { keyword: 'Lumen', url: '/article/best-unreal-engine-5-pc-graphics-settings-fps-guide' },
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function remarkAutoInternalLinks() {
  return (tree, file) => {
    // 1. Determine current article slug from file path
    const filePath = file.path || (file.history && file.history[0]) || '';
    const fileBasename = path.basename(filePath, path.extname(filePath));
    const currentSlug = fileBasename.toLowerCase().replace(/\s+/g, '-');
    const currentUrl = `/article/${currentSlug}`;

    // 2. Track linked keywords per article to ensure max 1 link per keyword per article
    const linkedKeywordsInFile = new Set();

    // 3. Process node children recursively, skipping restricted node types
    function processNode(node) {
      if (!node || !node.children) return;

      // Skip restricted container types (headings, existing links, code, blockquotes, raw html)
      if (['heading', 'link', 'code', 'inlineCode', 'blockquote', 'html'].includes(node.type)) {
        return;
      }

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];

        if (['heading', 'link', 'code', 'inlineCode', 'blockquote', 'html'].includes(child.type)) {
          continue;
        }

        if (child.type === 'text') {
          const replacementNodes = transformTextNode(child.value, currentUrl, linkedKeywordsInFile);
          if (replacementNodes) {
            node.children.splice(i, 1, ...replacementNodes);
            i += replacementNodes.length - 1;
          }
        } else if (child.children) {
          processNode(child);
        }
      }
    }

    processNode(tree);
  };
}

function transformTextNode(textValue, currentUrl, linkedKeywordsInFile) {
  if (!textValue || typeof textValue !== 'string') return null;

  for (const rule of KEYWORD_MAP) {
    // Safety Guardrail: Prevent self-referencing links
    if (rule.url === currentUrl || currentUrl.startsWith(rule.url)) {
      continue;
    }

    // Safety Guardrail: Match and link only the FIRST occurrence per keyword per article
    if (linkedKeywordsInFile.has(rule.keyword)) {
      continue;
    }

    // Whole word / phrase matching
    const regex = new RegExp(`\\b(${escapeRegex(rule.keyword)})\\b`, 'i');
    const match = textValue.match(regex);

    if (match && match.index !== undefined) {
      linkedKeywordsInFile.add(rule.keyword);

      const beforeText = textValue.slice(0, match.index);
      const matchedText = match[0];
      const afterText = textValue.slice(match.index + matchedText.length);

      const result = [];

      if (beforeText) {
        result.push({ type: 'text', value: beforeText });
      }

      result.push({
        type: 'link',
        url: rule.url,
        children: [{ type: 'text', value: matchedText }]
      });

      if (afterText) {
        // Recursively check remaining text for other keywords
        const restNodes = transformTextNode(afterText, currentUrl, linkedKeywordsInFile);
        if (restNodes) {
          result.push(...restNodes);
        } else {
          result.push({ type: 'text', value: afterText });
        }
      }

      return result;
    }
  }

  return null;
}
