#include <stdlib.h>

void use(char *buf);

void on_stack(void) {
    char buf[4096];           /* stack: one subtraction */
    use(buf);
}

void on_heap(void) {
    char *buf = malloc(4096); /* heap: a call into the allocator */
    use(buf);
    free(buf);
}
