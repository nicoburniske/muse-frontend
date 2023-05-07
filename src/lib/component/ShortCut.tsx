export const ShortCut = ({ actionKey, modifierKey }: { actionKey: string; modifierKey: string }) => {
   return (
      <kbd className='pointer-events-none absolute right-1.5 top-2.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex'>
         <span className='text-xs'>{modifierKey}</span>
         {actionKey}
      </kbd>
   )
}
