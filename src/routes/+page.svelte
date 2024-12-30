<script module lang="ts">
    import type { Template } from '@locale/LocaleText';

    export type LandingPageText = {
        /** The value proposition for the site */
        value: Template;
        /** A description of the platform's features */
        description: Template | Template[];
        /** The landing page beta warning */
        beta: Template[];
        /** The subtitles below links */
        link: {
            /** What content is on the about page */
            about: string;
            /** What content is on the learn page */
            learn: string;
            /** What content is on the teach page */
            teach: string;
            /** What content is on the guide page */
            guide: string;
            /** What content is on the projects page */
            projects: string;
            /** What content is on the galleries page */
            galleries: string;
            /** What content is on the rights page */
            rights: string;
            /** The community link */
            community: {
                label: string;
                subtitle: string;
            };
            /** The contributor link */
            contribute: {
                label: string;
                subtitle: string;
            };
        };
    };
</script>

<script lang="ts">
<<<<<<< HEAD
=======
    import Header from '@components/app/Header.svelte';
    import BigLink from '../components/app/BigLink.svelte';
    import Background from '../components/app/Background.svelte';
    import { locales } from '../db/Database';
    import Writing from '../components/app/Writing.svelte';
    import MarkupHtmlView from '../components/concepts/MarkupHTMLView.svelte';
    import Emoji from '@components/app/Emoji.svelte';
>>>>>>> refs/remotes/origin/main
    import Action from '@components/app/Action.svelte';
    import Emoji from '@components/app/Emoji.svelte';
    import Header from '@components/app/Header.svelte';
    import Lead from '@components/app/Lead.svelte';
    import Speech from '@components/lore/Speech.svelte';
    import { getUser } from '@components/project/Contexts';
    import {
        DOCUMENTATION_SYMBOL,
        EDIT_SYMBOL,
        STAGE_SYMBOL,
    } from '@parser/Symbols';
    import Background from '../components/app/Background.svelte';
    import BigLink from '../components/app/BigLink.svelte';
    import Writing from '../components/app/Writing.svelte';
    import MarkupHtmlView from '../components/concepts/MarkupHTMLView.svelte';
    import { locales } from '../db/Database';
    import Emotion from '../lore/Emotion';
    import Glyphs from '../lore/Glyphs';
    import Beta from './Beta.svelte';
    import Iconified from './Iconified.svelte';

    const user = getUser();
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <title>Wordplay</title>
</svelte:head>

<Background />
<Writing footer={false}>
    <Beta />
    <Header><Emoji>💬</Emoji>{$locales.get((l) => l.wordplay)}</Header>
    <div class="welcome">
        <div style:margin-inline-start="-2.5em">
            <Speech glyph={Glyphs.Function} emotion={Emotion.happy} big
                >{#snippet content()}
                    <MarkupHtmlView
                        markup={$locales.get((l) => l.ui.page.landing.value)}
                    />
                {/snippet}</Speech
            >
        </div>
    </div>
    <MarkupHtmlView
        markup={$locales.get((l) => l.ui.page.landing.description)}
    />
    {#if $user === null}
        <br />
        <BigLink
            to="/login"
            subtitle={$locales.get((l) => l.ui.page.login.subtitle)}
            >{$locales.get((l) => l.ui.page.login.header)}</BigLink
        >
    {/if}
    <br />
    <div class="actions">
        <Action>
            <BigLink
                to="/projects"
                smaller
                subtitle={$locales.get((l) => l.ui.page.landing.link.projects)}
                ><Iconified
                    icon={EDIT_SYMBOL}
                    text={(l) => l.ui.page.projects.header}
                /></BigLink
            >
        </Action>
        <Action>
            <BigLink
                smaller
                to="/galleries"
                subtitle={$locales.get((l) => l.ui.page.landing.link.galleries)}
                ><Iconified
                    icon={STAGE_SYMBOL}
                    text={(l) => l.ui.page.galleries.header}
                /></BigLink
            >
        </Action>
        <Action>
            <BigLink
                smaller
                to="/learn"
                subtitle={$locales.get((l) => l.ui.page.landing.link.learn)}
                ><Iconified
                    icon="🙋"
                    text={(l) => l.ui.page.learn.header}
                /></BigLink
            >
        </Action>
        <Action>
            <BigLink
                to="/guide"
                smaller
                subtitle={$locales.get((l) => l.ui.page.landing.link.guide)}
                ><Iconified
                    icon={DOCUMENTATION_SYMBOL}
                    text={(l) => l.ui.page.guide.header}
                /></BigLink
            >
        </Action>
        <Action>
            <BigLink
                smaller
                to="/teach"
                subtitle={$locales.get((l) => l.ui.page.landing.link.teach)}
                ><Iconified
                    icon="🧑🏽‍🏫"
                    text={(l) => l.ui.page.teach.header}
                /></BigLink
            >
        </Action>
        <Action meta>
            <BigLink
                smaller
                to="/about"
                subtitle={$locales.get((l) => l.ui.page.landing.link.about)}
                ><Iconified
                    icon="💭"
                    text={(l) => l.ui.page.about.header}
                /></BigLink
            >
        </Action>
        <Action meta>
            <BigLink
                smaller
                to="/rights"
                subtitle={$locales.get((l) => l.ui.page.landing.link.rights)}
                ><Iconified
                    icon="⚖️"
                    text={(l) => l.ui.page.rights.header}
                /></BigLink
            ></Action
        >
        <Action meta>
            <BigLink
                smaller
                external
                to="https://discord.gg/Jh2Qq9husy"
                subtitle={$locales.get(
                    (l) => l.ui.page.landing.link.community.subtitle,
                )}
                ><Iconified
                    icon="🗣️"
                    text={(l) => l.ui.page.landing.link.community.label}
                /></BigLink
            ></Action
        >
        <Action meta>
            <BigLink
                smaller
                external
                to="https://github.com/wordplaydev/wordplay/wiki/contribute"
                subtitle={$locales.get(
                    (l) => l.ui.page.landing.link.contribute.subtitle,
                )}
                ><Iconified
                    icon="🛠️"
                    text={(l) => l.ui.page.landing.link.contribute.label}
                />
            </BigLink>
        </Action>
        <Action meta>
            <BigLink
                smaller
                to="/donate"
                subtitle={$locales.get((l) => l.ui.page.donate.prompt)}
            >
                <Iconified icon="🤑" text={(l) => l.ui.page.donate.header} />
            </BigLink>
        </Action>
    </div>
    <div class="contributors-link">
        <Action href="/contributors">View Contributors</Action>
    </div>
</Writing>

<style>
    .welcome {
        display: flex;
        flex-direction: row;
        gap: calc(var(--wordplay-spacing) * 2);
        margin-top: 2em;
        margin-bottom: 2em;
        max-width: 100%;
    }

    .actions {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: var(--wordplay-spacing);
        align-items: stretch;
    }
<<<<<<< HEAD

    .details {
        display: flex;
        flex-direction: column;
        gap: calc(var(--wordplay-spacing) * 2);
        padding: calc(2 * var(--wordplay-spacing));
        min-height: 20em;
        margin-left: auto;
        margin-right: auto;
    }

    .links {
        display: flex;
        flex-direction: row;
        gap: var(--wordplay-spacing);
    }

    .column {
        display: flex;
        flex-direction: column;
        gap: calc(2 * var(--wordplay-spacing));
        flex-grow: 1;
        flex-basis: 0;
    }

    .contributors-link {
        text-align: center;
        margin-top: 20px;
    }
=======
>>>>>>> refs/remotes/origin/main
</style>
