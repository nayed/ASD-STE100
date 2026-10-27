func TestDivide(t *testing.T) {
	tests := []struct {
		name    string
		a, b    float64
		want    float64
		wantErr bool
	}{
		{"simple", 10, 4, 2.5, false},
		{"negative", -9, 3, -3, false},
		{"by zero", 1, 0, 0, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := divide(tt.a, tt.b)
			if (err != nil) != tt.wantErr || got != tt.want {
				t.Errorf("divide(%v, %v) = %v, %v", tt.a, tt.b, got, err)
			}
		})
	}
}
