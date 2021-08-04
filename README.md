# ddc-nextword: nextword completion for ddc.vim

A ddc.vim source for `nextword` for completing words in English.


## Dependencies

* https://github.com/high-moctane/nextword

* https://github.com/high-moctane/nextword-data

* Set `$NEXTWORD_DATA_PATH` environment variable


## Configuration

```vim
" Use nextword source.
call ddc#custom#patch_global('sources', ['nextword'])
```


## License

MIT
