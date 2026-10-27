#include <stdlib.h>

int main(void) {
    int *p = malloc(4 * sizeof(int));
    p[0] = 1;
    p = NULL;             /* the only pointer is lost */
    return 0;
}
