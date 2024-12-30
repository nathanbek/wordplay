<script lang="ts">
    import { goto } from '$app/navigation';
    import { Octokit } from '@octokit/rest';
    import { onMount } from 'svelte';

    interface Contributor {
        login: string;
        active: boolean;
        contributions: number;
        team: string;
        avatar_url?: string;
        locale?: string;
        role?: string;
    }

    let contributors: Contributor[] = [];
    let selectedTeam = 'All Contributors';
    let loading = true;
    let error: string | null = null;

    // Define teams based on project roles
    const teams = [
        { name: 'All Contributors', slug: 'all', emoji: '👥' },
        { name: 'Mentor', slug: 'mentor', emoji: '👨‍🏫' },
        { name: 'Design', slug: 'design', emoji: '🎨' },
        { name: 'Develop', slug: 'develop', emoji: '💻' },
        { name: 'Verify', slug: 'verify', emoji: '✅' },
        { name: 'Localize', slug: 'localize', emoji: '🌍' },
        { name: 'Curate', slug: 'curate', emoji: '📚' },
        { name: 'Research', slug: 'research', emoji: '🔬' },
        { name: 'More Contributors', slug: 'more', emoji: '⭐' },
    ];

    // Define localization teams
    const locales = [
        { code: 'en', name: 'English', emoji: '🇺🇸' },
        { code: 'es', name: 'Spanish', emoji: '🇪🇸' },
        { code: 'zh', name: 'Chinese', emoji: '🇨🇳' },
        { code: 'hi', name: 'Hindi', emoji: '🇮🇳' },
        { code: 'ar', name: 'Arabic', emoji: '🇦🇪' },
        { code: 'fr', name: 'French', emoji: '🇫🇷' },
        { code: 'pt', name: 'Portuguese', emoji: '🇧🇷' },
        { code: 'ru', name: 'Russian', emoji: '🇷🇺' },
        { code: 'ja', name: 'Japanese', emoji: '🇯🇵' },
        { code: 'ko', name: 'Korean', emoji: '🇰🇷' },
    ];

    // Leadership roles
    const leadershipRoles = [
        {
            title: 'Coordinate 🎯',
            description: "Leading Wordplay's development and community.",
            members: ['amyjko'],
        },
        {
            title: 'Research 🔍',
            description:
                'Advancing the science of programming language design.',
            members: ['amyjko'],
        },
    ];

    function selectTeam(teamName: string) {
        selectedTeam = teamName;
    }

    function goHome() {
        goto('/');
    }

    function getContributorsByTeam(team: string) {
        return contributors.filter((c) =>
            team === 'All Contributors'
                ? true
                : team === 'More Contributors'
                  ? !teams.some(
                        (t) =>
                            t.slug !== 'more' &&
                            t.slug !== 'all' &&
                            c.team === t.name,
                    )
                  : c.team === team,
        );
    }

    function getLocalizationContributors() {
        const localeContributors: Record<string, Contributor[]> = {};
        contributors
            .filter((c) => c.team === 'Localize')
            .forEach((contributor) => {
                const locale = contributor.locale || 'other';
                if (!localeContributors[locale]) {
                    localeContributors[locale] = [];
                }
                localeContributors[locale].push(contributor);
            });
        return localeContributors;
    }

    onMount(async () => {
        try {
            const octokit = new Octokit();

            // Get all repository contributors
            const { data: repoContributors } =
                await octokit.repos.listContributors({
                    owner: 'wordplaydev',
                    repo: 'wordplay',
                    per_page: 100,
                    headers: {
                        accept: 'application/vnd.github.v3+json',
                    },
                });

            const contributorMap: Record<string, Contributor> = {};

            // Add contributors from GitHub
            repoContributors.forEach((contributor) => {
                if (contributor.login) {
                    contributorMap[contributor.login] = {
                        login: contributor.login,
                        active: true,
                        contributions: contributor.contributions || 0,
                        team: 'More Contributors',
                        avatar_url: contributor.avatar_url,
                    };
                }
            });

            // Add known contributors with their roles
            const knownContributors = [
                {
                    login: 'amyjko',
                    team: 'Develop',
                    active: true,
                    role: 'Lead',
                },
                { login: 'benjiwheeler', team: 'Develop', active: true },
                { login: 'nathanbekele', team: 'Develop', active: true },
                // Add localization contributors
                {
                    login: 'translator1',
                    team: 'Localize',
                    active: true,
                    locale: 'es',
                },
                {
                    login: 'translator2',
                    team: 'Localize',
                    active: true,
                    locale: 'zh',
                },
            ];

            knownContributors.forEach(
                ({ login, team, active, role, locale }) => {
                    if (contributorMap[login]) {
                        contributorMap[login].team = team;
                        contributorMap[login].active = active;
                        if (role) contributorMap[login].role = role;
                        if (locale) contributorMap[login].locale = locale;
                    } else {
                        contributorMap[login] = {
                            login,
                            active,
                            contributions: 1,
                            team,
                            role,
                            locale,
                            avatar_url: `https://github.com/${login}.png`,
                        };
                    }
                },
            );

            contributors = Object.values(contributorMap);
            contributors.sort((a, b) => b.contributions - a.contributions);

            if (contributors.length === 0) {
                throw new Error('No contributors found');
            }
        } catch (err) {
            console.error('Error fetching contributors:', err);
            error = 'Failed to load contributors. Please try again later.';
        } finally {
            loading = false;
        }
    });
</script>

<div class="contributors-page">
    <div class="header">
        <button class="home-button" on:click={goHome}>← Back to Home</button>
        <h1>Contributors</h1>
    </div>

    <section class="leadership">
        <h2>Leadership Roles</h2>
        <div class="roles-grid">
            {#each leadershipRoles as role}
                <div class="role-card">
                    <h3>{role.title}</h3>
                    <p>{role.description}</p>
                    {#if role.members.length > 0}
                        <div class="role-members">
                            {#each role.members as member}
                                {#if contributors.find((c) => c.login === member)}
                                    <a
                                        href="https://github.com/wordplaydev/wordplay/commits?author={member}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="member-link"
                                    >
                                        <img
                                            src="https://github.com/{member}.png"
                                            alt="{member}'s avatar"
                                            class="member-avatar"
                                        />
                                        <span>{member}</span>
                                    </a>
                                {/if}
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </section>

    <section class="teams">
        <h2>Roles</h2>
        <div class="team-buttons">
            {#each teams as team}
                <button
                    class="team-button"
                    class:active={selectedTeam === team.name}
                    on:click={() => selectTeam(team.name)}
                >
                    {team.emoji}
                    {team.name}
                </button>
            {/each}
        </div>
    </section>

    <div class="status-legend">
        <span class="status active">Active</span>
        <span class="status inactive">Inactive</span>
    </div>

    <p class="note">* Contributors are listed by number of contributions</p>

    {#if loading}
        <div class="loading">
            <div class="loading-spinner"></div>
            Loading contributors...
        </div>
    {:else if error}
        <div class="error">{error}</div>
    {:else}
        <div class="contributors-grid">
            {#if selectedTeam === 'Localize'}
                {#each Object.entries(getLocalizationContributors()) as [locale, localeContributors]}
                    <div class="locale-section">
                        <h3 class="locale-title">
                            {locales.find((l) => l.code === locale)?.emoji ||
                                '🌍'}
                            {locales.find((l) => l.code === locale)?.name ||
                                'Other'}
                        </h3>
                        <div class="locale-contributors">
                            {#each localeContributors as contributor}
                                <a
                                    href="https://github.com/wordplaydev/wordplay/commits?author={contributor.login}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="contributor-card"
                                    class:inactive={!contributor.active}
                                >
                                    {#if contributor.avatar_url}
                                        <img
                                            src={contributor.avatar_url}
                                            alt={`${contributor.login}'s avatar`}
                                            class="avatar"
                                        />
                                    {/if}
                                    <div class="contributor-info">
                                        <span class="contributor-name"
                                            >{contributor.login}</span
                                        >
                                        <span class="contribution-count">
                                            {contributor.contributions} contribution{contributor.contributions !==
                                            1
                                                ? 's'
                                                : ''}
                                        </span>
                                    </div>
                                </a>
                            {/each}
                        </div>
                    </div>
                {/each}
            {:else}
                {#each getContributorsByTeam(selectedTeam) as contributor}
                    <a
                        href="https://github.com/wordplaydev/wordplay/commits?author={contributor.login}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="contributor-card"
                        class:inactive={!contributor.active}
                    >
                        {#if contributor.avatar_url}
                            <img
                                src={contributor.avatar_url}
                                alt={`${contributor.login}'s avatar`}
                                class="avatar"
                            />
                        {/if}
                        <div class="contributor-info">
                            <span class="contributor-name"
                                >{contributor.login}</span
                            >
                            <span class="contribution-count">
                                {contributor.contributions} contribution{contributor.contributions !==
                                1
                                    ? 's'
                                    : ''}
                            </span>
                            {#if contributor.role}
                                <span class="role-badge"
                                    >{contributor.role}</span
                                >
                            {/if}
                        </div>
                    </a>
                {/each}
            {/if}
        </div>
    {/if}
</div>

<style>
    :global(body) {
        background-color: #0a0a0a;
        color: #ffffff;
        font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            Roboto,
            sans-serif;
    }

    .contributors-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 2rem;
        margin-bottom: 3rem;
    }

    h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0;
    }

    .home-button {
        padding: 0.75rem 1.5rem;
        background-color: transparent;
        border: 2px solid #ffffff;
        color: #ffffff;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;
        font-size: 1rem;
    }

    .home-button:hover {
        background-color: #ffffff;
        color: #0a0a0a;
    }

    .roles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
    }

    .role-card {
        background-color: #fff9c4;
        padding: 1.5rem;
        border-radius: 12px;
        color: #0a0a0a;
        transition: transform 0.2s ease;
    }

    .role-card:hover {
        transform: translateY(-2px);
    }

    .role-card h3 {
        font-size: 1.5rem;
        margin: 0 0 0.5rem 0;
        color: #0a0a0a;
    }

    .team-buttons {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    .team-button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 20px;
        background-color: #ffffff1a;
        color: #ffffff;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;
        font-size: 0.9rem;
    }

    .team-button:hover {
        background-color: #ffffff33;
    }

    .team-button.active {
        background-color: #fdd835;
        color: #0a0a0a;
    }

    .status-legend {
        display: flex;
        gap: 1.5rem;
        justify-content: center;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
    }

    .status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        opacity: 0.8;
    }

    .status.active::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #4caf50;
    }

    .status.inactive::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #9e9e9e;
    }

    .note {
        text-align: center;
        font-style: italic;
        margin-bottom: 2rem;
        opacity: 0.7;
        font-size: 0.9rem;
    }

    .contributors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
    }

    .contributor-card {
        background-color: #ffffff0d;
        padding: 1rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: all 0.2s ease;
    }

    .contributor-card:hover {
        background-color: #ffffff1a;
        transform: translateY(-2px);
    }

    .contributor-card.inactive {
        opacity: 0.6;
    }

    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }

    .contributor-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .contributor-name {
        font-weight: 500;
    }

    .contribution-count {
        font-size: 0.85rem;
        opacity: 0.7;
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 3rem;
        font-size: 1.1rem;
        color: #ffffff99;
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #ffffff33;
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .error {
        text-align: center;
        padding: 2rem;
        color: #ff6b6b;
        background-color: #ff6b6b1a;
        border-radius: 8px;
        font-size: 1rem;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 768px) {
        .contributors-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }

        .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
        }

        .team-buttons {
            justify-content: flex-start;
        }
    }

    .role-members {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .member-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        color: inherit;
        padding: 0.25rem 0.5rem;
        background-color: #0000001a;
        border-radius: 20px;
        transition: all 0.2s ease;
    }

    .member-link:hover {
        background-color: #00000033;
    }

    .member-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
    }

    .locale-section {
        background-color: #ffffff0d;
        padding: 1.5rem;
        border-radius: 12px;
        margin-bottom: 2rem;
    }

    .locale-title {
        font-size: 1.5rem;
        margin: 0 0 1rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .locale-contributors {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
    }

    .role-badge {
        font-size: 0.75rem;
        padding: 0.15rem 0.5rem;
        background-color: #fdd835;
        color: #0a0a0a;
        border-radius: 12px;
        font-weight: 500;
    }

    .team-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    @media (max-width: 768px) {
        .locale-contributors {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
    }
</style>
