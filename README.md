# ddc-source-nextword: nextword completion for ddc.vim

A ddc.vim source for `nextword` for completing words in English.

**Note: "nextword" is deprecated. You should use
[ddc-mocword](https://github.com/Shougo/ddc-mocword) instead.**

## Dependencies

**Note: "nextword" binary must be installed in your `$PATH`!!**

- https://github.com/high-moctane/nextword

- https://github.com/high-moctane/nextword-data

- Set `$NEXTWORD_DATA_PATH` environment variable

Please test `nextword -n 100 -g` works from command line.

## Configuration

```vim
call ddc#custom#patch_global('sources', ['nextword'])
call ddc#custom#patch_global('sourceOptions', {
    \ 'nextword': {
    \   'mark': 'nextword',
    \   'minAutoCompleteLength': 3,
    \   'isVolatile': v:true,
    \ }})
```

## License

MIT
