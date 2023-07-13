import { useIsFocused } from "@react-navigation/native";
import { useState, useEffect, useRef } from "react";
import { Animated } from "react-native";

export const useTimingAnimation = (duration, toValue) => {
    const [animation] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(animation, {
            duration,
            toValue,
            useNativeDriver: true,
        }).start();
    });

    return animation;
};

// Use previous state's value
export function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

// Run when dependencies' values changed (Except first mount)
export function useUpdateEffect(effect, dependencies = []) {
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            return effect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);
}

// useInterval hook
export function useInterval(callback, delay) {
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    });

    useEffect(() => {
        function tick() {
            savedCallback.current();
        }

        const id = setInterval(tick, delay);
        return () => clearInterval(id);
    }, [delay]);
}

// useInterval hook only when screen is focused.
/**
 * Utilising react-navigation's useIsFocused.
 * Does not work if screen is tab 1 of a tabview,
 * and user switch to tab 2 as the screen is still focused as far as react-navigation is concerned
 */
export function useIntervalOnlyIsFocused(callback, delay) {
    const isFocused = useIsFocused();
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    });

    useEffect(() => {
        function tick() {
            isFocused && savedCallback.current();
        }

        const id = setInterval(tick, delay);
        return () => clearInterval(id);
    }, [delay, isFocused]);
}

// Run everytime screen is focused (Except first mount)
/** Replacement for react-navigation's useFocusEffect. useFocusEffect's implementation as below:
        useFocusEffect(
            useCallback(() => {
                const isRefreshing = route.params?.refresh;

                if (isRefreshing) {
                    getDonationDetails();
                }

                return () => {};
            }, [route, getDonationDetails])
        );
    It re-calls everytime useCallback's dependency updates. 
    Means it might have infinite loading (correct me if im wrong).
 */
export function useIsFocusedExceptMount(effect) {
    const isInitialMount = useRef(true);
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else if (!prevIsFocused && isFocused) {
            return effect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused]);
}

// Run everytime screen is focused
export function useIsFocusedIncludingMount(effect) {
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    useEffect(() => {
        if (!prevIsFocused && isFocused) {
            return effect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused]);
}

// Same function as above, support one additional parameter
/**
 * For screen that is deeply nested (e.g Tabbed screen), switching to another 'tab' would not trigger react-navigation's isFocused,
 * since technically there's no screen navigation happen and everything is still on screen.
 */
export function useNestedIsFocusedExceptMount(effect, isNestedFocused) {
    const isInitialMount = useRef(true);
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);

    const prevIsNestedFocused = usePrevious(isNestedFocused);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else if ((!prevIsFocused && isFocused) || (!prevIsNestedFocused && isNestedFocused)) {
            return effect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused, isNestedFocused]);
}
export function useNestedIsFocusedIncludingMount(effect, isNestedFocused) {
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);

    const prevIsNestedFocused = usePrevious(isNestedFocused);
    useEffect(() => {
        if ((!prevIsFocused && isFocused) || (!prevIsNestedFocused && isNestedFocused)) {
            return effect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused, isNestedFocused]);
}

// Run on screen mount. same with componentDidMount
/**
 *  Same with
        useEffect(() => {
            doSomething();
        }, []);
    , just more verbose
 */
export function useDidMount(effect) {
    useEffect(() => {
        return effect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
