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
    }

    let contributors: Contributor[] = [];
    let selectedTeam = 'All';
    let loading = true;
    let error: string | null = null;

    const teams = [
        { name: 'All Contributors', slug: 'all' },
        { name: 'Curate', slug: 'curate' },
        { name: 'Design', slug: 'design' },
        { name: 'Develop', slug: 'dev' },
        { name: 'Localize', slug: 'localize' },
        { name: 'Mentor', slug: 'mentor' },
        { name: 'Verify', slug: 'verify' },
        { name: 'More Contributors', slug: 'more' },
    ];

    function selectTeam(teamName: string) {
        selectedTeam = teamName;
    }

    function goHome() {
        goto('/');
    }

    onMount(async () => {
        try {
            // Initialize Octokit without auth for public repo
            const octokit = new Octokit();

            // First get all repository contributors
            const { data: repoContributors } =
                await octokit.repos.listContributors({
                    owner: 'wordplaydev',
                    repo: 'wordplay',
                    per_page: 100,
                    headers: {
                        accept: 'application/vnd.github.v3+json',
                    },
                });

            // Create initial map of all contributors
            const contributorMap: Record<string, Contributor> = {};

            // Add contributors from the contributors graph
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
                { login: 'amyjko', team: 'Develop', active: true },
                { login: 'benjiwheeler', team: 'Develop', active: true },
                { login: 'nathanbekele', team: 'Develop', active: true },
            ];

            // Add or update known contributors
            knownContributors.forEach(({ login, team, active }) => {
                if (contributorMap[login]) {
                    contributorMap[login].team = team;
                    contributorMap[login].active = active;
                } else {
                    contributorMap[login] = {
                        login,
                        active,
                        contributions: 1,
                        team,
                        avatar_url: `https://github.com/${login}.png`,
                    };
                }
            });

            // Convert to array and sort by contributions
            contributors = Object.values(contributorMap);
            contributors.sort((a, b) => b.contributions - a.contributions);

            // If we have no contributors at this point, throw an error
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
            <div class="role-card">
                <h3>Coordinate 🎯</h3>
                <p>Leading Wordplay's development and community.</p>
            </div>
            <div class="role-card">
                <h3>Research 🔍</h3>
                <p>Advancing the science of programming language design.</p>
            </div>
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
            {#each contributors.filter((c) => selectedTeam === 'All Contributors' || c.team === selectedTeam) as contributor}
                <div
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
                        <span class="contributor-name">{contributor.login}</span
                        >
                        <span class="contribution-count">
                            {contributor.contributions} contribution{contributor.contributions !==
                            1
                                ? 's'
                                : ''}
                        </span>
                    </div>
                </div>
            {/each}
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
</style>
