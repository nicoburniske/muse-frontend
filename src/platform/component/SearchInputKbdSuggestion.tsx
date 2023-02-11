import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { useCallback, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useHotkeys } from 'react-hotkeys-hook'

export type SearchInputKbdSuggestionProps = {
   screenReaderLabel: string
   placeholder: string
   search: string
   setSearch: (value: string) => void
}

export const SearchInputKbdSuggestion = ({
   screenReaderLabel,
   placeholder,
   search,
   setSearch,
}: SearchInputKbdSuggestionProps) => {
   const inputRef = useRef<HTMLInputElement>(null)
   const [isSearching, setIsSearching] = useState(false)
   const focus = useCallback(() => {
      // We want to guarantee the input is rendered before focusing.
      flushSync(() => setIsSearching(true))
      inputRef.current?.focus()
   }, [inputRef, setIsSearching])
   useHotkeys('meta+k', focus, [inputRef])

   return (
      <div className='flex py-1'>
         <label htmlFor='search-field' className='sr-only'>
            {screenReaderLabel}
         </label>
         <div className='flex w-full flex-row items-center justify-between pr-4 text-base-content'>
            <div className='p-4'>
               <MagnifyingGlassIcon className='h-5 w-5 flex-shrink-0' aria-hidden='true' />
            </div>
            <div className='relative grow'>
               <input
                  ref={inputRef}
                  name='search-field'
                  id='search-field'
                  className='input w-full border-2 border-base-content/20 text-left text-base placeholder-base-content/50 caret-primary focus:border-primary focus:outline-none focus:ring-primary sm:text-sm'
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

const ShortCut = () => {
   return (
      <div className={'pointer-events-none absolute right-8 top-3 hidden gap-1 opacity-50 lg:flex'}>
         <kbd className='kbd kbd-sm'>⌘</kbd>+<kbd className='kbd kbd-sm'>k</kbd>
      </div>
   )
}
