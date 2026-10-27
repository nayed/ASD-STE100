#include <stdlib.h>

int *make_counter(int start) {
    int *p = malloc(sizeof(int));   /* heap */
    *p = start;
    return p;
}

int main(void) {
    int step = 2;                   /* stack */
    int *c = make_counter(10);
    *c += step;
    free(c);                        /* give back */
    return 0;
}
