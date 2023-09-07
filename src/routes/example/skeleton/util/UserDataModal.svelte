<script lang="ts">
    import type { UserData } from '../../util/UserData.js';

    export let item: UserData;
    export let toggle = undefined;

    const randomImageId = Math.ceil(Math.random() * 20);
    const lastOnlineAmount = Math.ceil(Math.random() * 60);
    const lastOnlineUnit = Math.random() > 0.5 ? 'hours' : 'minutes';
    const showPasswortAlert = Math.random() > 0.7;
    const passwordAlertMonths = Math.ceil(Math.random() * 4);
</script>

<div
    class="py-4 container mx-auto flex flex-col lg:flex-row justify-center lg:justify-start items-center gap-8 lg:gap-0"
>
    <div class="lg:w-1/4 flex justify-center">
        <img
            src="/img/random-persons/{item.gender}/{randomImageId}.jpg"
            alt="Picture of {item.firstName} {item.lastName}"
        />
    </div>
    <div class="lg:w-2/4">
        <div class="mb-2">
            <h4 class="mb-0 h4">
                {item.firstName}
                {item.lastName} <small class="text-surface-500">@{item.userName}</small>
            </h4>
            <small class="text-surface-500 text-sm">Last online {lastOnlineAmount} {lastOnlineUnit} ago</small>
        </div>
        <p>
            Contact: <a href="mailto:{item.mailAddress}_NOT_AN_ACTUAL_EMAIL" class="text-primary-500"
                >{item.mailAddress}</a
            >
        </p>
        {#if showPasswortAlert}
            <div class="alert variant-ghost-error mt-4">
                The user hasn't changed their password for {passwordAlertMonths} months!
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
