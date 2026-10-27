from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split

iris = load_iris()
X, y = iris.data, iris.target
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=0)

forest = RandomForestClassifier(
    n_estimators=200,      # B: the number of trees
    max_features="sqrt",   # m = √p at each split
    oob_score=True,        # compute the OOB score (section 7.0)
    n_jobs=-1,             # train the trees in parallel
    random_state=0,
)
forest.fit(X_train, y_train)

print(f"OOB score:  {forest.oob_score_:.3f}")
print(f"test score: {forest.score(X_test, y_test):.3f}")

# permutation importance on test data (section 8.0)
result = permutation_importance(forest, X_test, y_test, random_state=0)
for name, value in zip(iris.feature_names, result.importances_mean):
    print(f"{name:18} {value:.3f}")
