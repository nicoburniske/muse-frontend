import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { atom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { osAtom } from '@/state/Atoms'
import { cn } from '@/util/Utils'

import { Input } from './Input'
import { ShortCut } from './ShortCut'

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

   useHotkeys(['meta+f', 'ctrl+f'], focus, { preventDefault: true }, [inputRef])

   const modifier = useAtomValue(modifierKeyAtom)

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
                  className='flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
               />
               {!isSearching && <ShortCut actionKey='F' modifierKey={modifier} />}
            </div>
         </div>
      </div>
   )
}

const modifierKeyAtom = atom(get => (get(osAtom) === 'macos' ? '⌘' : 'ctrl'))
