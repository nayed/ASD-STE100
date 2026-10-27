#include <stdio.h>
#include <stdlib.h>

int initialized = 42;   /* data: a global with a value */
int zeroed;             /* bss: a global without a value */

int main(void) {
    int local = 7;                      /* stack */
    int *small = malloc(sizeof(int));   /* heap */
    char *large = malloc(1 << 20);      /* 1 MiB: its own mapping */

    printf("text    main()       %p\n", (void *)main);
    printf("data    initialized  %p\n", (void *)&initialized);
    printf("bss     zeroed       %p\n", (void *)&zeroed);
    printf("heap    small        %p\n", (void *)small);
    printf("mapped  large        %p\n", (void *)large);
    printf("lib     printf()     %p\n", (void *)printf);
    printf("stack   local        %p\n", (void *)&local);

    free(large);
    free(small);
    return local - 7;
}
