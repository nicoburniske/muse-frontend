import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { atom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { osAtom } from '@/state/Atoms'

import { Input } from './Input'

export type SearchInputKbdSuggestionProps = {
   screenReaderLabel: string
   placeholder: string
   autoFocus?: boolean
   search: string
   setSearch: (value: string) => void
}

export const SearchInputKbdSuggestion = ({
   screenReaderLabel,
   placeholder,
   autoFocus = false,
   search,
   setSearch,
}: SearchInputKbdSuggestionProps) => {
   const inputRef = useRef<HTMLInputElement>(null)
   const [isSearching, setIsSearching] = useState(false)
   const focus = useCallback(() => {
      setIsSearching(true)
      inputRef.current?.focus()
   }, [inputRef, setIsSearching])

   useEffect(() => {
      if (autoFocus) {
         focus()
      }
   }, [autoFocus, focus])

   const keyCombo = useAtomValue(keyComboAtom)
   useHotkeys(keyCombo, focus, [inputRef])

   return (
      <div className='flex py-1'>
         <label htmlFor='search-field' className='sr-only'>
            {screenReaderLabel}
         </label>
         <div className='flex w-full flex-row items-center justify-between pr-4 text-foreground'>
            <div className='p-4'>
               <MagnifyingGlassIcon className='h-5 w-5 flex-shrink-0' aria-hidden='true' />
            </div>
            <div className='relative grow'>
               <Input
                  ref={inputRef}
                  name='search-field'
                  id='search-field'
                  value={search}
                  type='search'
                  autoComplete='off'
                  placeholder={placeholder}
                  onChange={e => setSearch(e.target.value as string)}
                  onFocus={() => setIsSearching(true)}
                  onBlur={() => setIsSearching(false)}
               />
               {!isSearching && <ShortCut />}
            </div>
         </div>
      </div>
   )
}

const keyComboAtom = atom(get => (get(osAtom) === 'macos' ? 'meta+k' : 'ctrl+k'))
const modifierKeyAtom = atom(get => (get(osAtom) === 'macos' ? '⌘' : 'ctrl'))
const ShortCut = () => {
   const modifier = useAtomValue(modifierKeyAtom)
   return (
      <div className={'pointer-events-none absolute right-4 top-2 hidden gap-1 opacity-50 lg:flex'}>
         <kbd className='kbd kbd-sm'>{modifier}</kbd>+<kbd className='kbd kbd-sm'>k</kbd>
      </div>
   )
}
