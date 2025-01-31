import { getContext, setContext } from 'svelte';

export const JOIN_GROUP_KEY = 'JOIN_GROUP_KEY';
export const setJoinGroupContext = (isJoinGroup: boolean) => setContext(JOIN_GROUP_KEY, isJoinGroup);
export const getJoinGroupContext = () => getContext<ReturnType<typeof setJoinGroupContext>>(JOIN_GROUP_KEY);
