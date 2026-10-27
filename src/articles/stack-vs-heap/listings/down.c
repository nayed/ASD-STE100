#include <stdio.h>

static long down(long n) {
    if (n % 50000 == 0)
        printf("depth %ld\n", n);
    return down(n + 1) + 1;   /* no end: each call adds a frame */
}

int main(void) {
    return (int)down(1);
}
