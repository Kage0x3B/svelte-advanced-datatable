<script lang="ts">
    import type { ModalProps } from '$lib/types/ModalProps.js';
    import type { UserData } from '../../util/UserData.js';

    let { item }: ModalProps<UserData> = $props();

    const lastOnlineAmount = Math.ceil(Math.random() * 60);
    const lastOnlineUnit = Math.random() > 0.5 ? 'hours' : 'minutes';
    const showPasswortAlert = Math.random() > 0.7;
    const passwordAlertMonths = Math.ceil(Math.random() * 4);
</script>

<div class="py-4 flex flex-wrap">
    <div class="flex flex-col items-center w-full lg:w-1/3">
        <img
            src="https://ui-avatars.com/api/?format=svg&background=random&name={item.firstName.slice(
                0,
                1
            )}+{item.lastName.slice(0, 1)}"
            alt="Picture of {item.firstName} {item.lastName}"
        />
    </div>
    <div class="w-full lg:w-2/3">
        <div class="mb-2">
            <h4 class="mb-0">{item.firstName} {item.lastName} <small class="text-muted">@{item.userName}</small></h4>
            <small class="text-muted">Last online {lastOnlineAmount} {lastOnlineUnit} ago</small>
        </div>
        <p>
            Contact: <a href="mailto:{item.mailAddress}_NOT_AN_ACTUAL_EMAIL">{item.mailAddress}</a>
        </p>
        {#if showPasswortAlert}
            <div role="alert" class="alert alert-warning">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <span>The user hasn't changed their password for {passwordAlertMonths} months!</span>
            </div>
        {/if}
    </div>
</div>

<style>
    img {
        width: 128px;
        height: 128px;
        border-radius: 50%;
        box-shadow:
            rgba(6, 24, 44, 0.4) 0 0 0 1px,
            rgba(6, 24, 44, 0.65) 0 4px 6px -1px,
            rgba(255, 255, 255, 0.08) 0 1px 0 inset;
    }
</style>
