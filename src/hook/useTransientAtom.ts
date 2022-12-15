import { useCallback, useContext, useEffect, useRef } from 'react'
import { SECRET_INTERNAL_getScopeContext as getScopeContext } from 'jotai'
import type { Atom, WritableAtom } from 'jotai'

type Scope = symbol | string | number;
type ResolveType<T> = T extends Promise<infer V> ? V : T;
type GetAtom<Value> = () => ResolveType<Value>;
type SetAtom<
    Update,
    Result extends void | Promise<void>,
> = undefined extends Update
    ? (update?: Update) => Result
    : (update: Update) => Result;
const READ_ATOM = 'r'
const WRITE_ATOM = 'w'
const COMMIT_ATOM = 'c'
const SUBSCRIBE_ATOM = 's'
const isWritable = <Value, Update, Result extends void | Promise<void>>(
    atom: Atom<Value> | WritableAtom<Value, Update, Result>,
): atom is WritableAtom<Value, Update, Result> =>
        !!(atom as WritableAtom<Value, Update, Result>).write

export function useTransientAtom<
    Value,
    Update,
    Result extends void | Promise<void>,
>(
    atom: WritableAtom<Value, Update, Result>,
    scope?: Scope,
): [GetAtom<Value>, SetAtom<Update, Result>];

export function useTransientAtom<Value>(
    atom: Atom<Value>,
    scope?: Scope,
): [GetAtom<Value>, never];

export function useTransientAtom<
    Value,
    Update,
    Result extends void | Promise<void>,
>(atom: Atom<Value> | WritableAtom<Value, Update, Result>, scope?: Scope) {
    const ScopeContext = getScopeContext(scope)
    const { s: store, w: versionedWrite } = useContext(ScopeContext)

    const getAtomValue = () => {
        const atomState = store[READ_ATOM](atom)
        if ('e' in atomState) {
            throw atomState.e // read error
        }
        if ('p' in atomState) {
            throw atomState.p // read promise
        }
        if ('v' in atomState) {
            return atomState.v as ResolveType<Value>
        }
        throw new Error('no atom value')
    }

    const getAtomValueRef = useRef(getAtomValue)
    useEffect(() => {
        getAtomValueRef.current = getAtomValue
    }, [store, atom])

    const commitRef = useRef<() => void>()
    useEffect(() => {
        const callback = () => {
            commitRef.current = () => {
                store[COMMIT_ATOM](atom)
            }
        }
        const unsubscribe = store[SUBSCRIBE_ATOM](atom, callback)
        callback()
        return () => {
            unsubscribe()
            commitRef.current = undefined
        }
    }, [store, atom])

    const getAtom = useCallback(() => {
        const value = getAtomValueRef.current()
        const commit = commitRef.current
        if (commit) {
            commitRef.current = undefined
            Promise.resolve().then(commit)
        }
        return value
    }, [])

    const setAtom = useCallback(
        (update: Update) => {
            if (isWritable(atom)) {
                return store[WRITE_ATOM](atom, update)
            }
            throw new Error('not writable atom')
        },
        [store, versionedWrite, atom],
    )

    return [getAtom, setAtom]
}