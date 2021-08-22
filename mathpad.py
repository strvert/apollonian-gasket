a = 48
b = 25
c = 28

o = 12

aPos = 1/o - 1/a
aPos = -aPos
print("a pos: ", aPos)
bPos = 1/o - 1/b
print("b pos: ", bPos)
cPos = 1/o - 1/c
print("c pos: ", cPos)

# s1 + s2 = dist
# s2 = dist - s1
# R1 : R2 = s1 : s2
# s1*R2 = s2*R1
# s1*R2 = (dist - s1)*R1
# (s1*R2)/R1 = dist - s1
# (R1*s1)/R1 + (s1*R2)/R1 = dist
# ((R1*s1) + (R2*s1))/R1 = dist
# (s1(R1 + R2))/R1 = dist
# s1 = dist * (R1/(R1 + R2))
R1 = (1/a + 1/b) / (1/b + 1/c)
print("R1: ", R1)
R2 = 1

dist = abs(aPos) + abs(cPos)
print("dist: ", dist)
s1 = dist * (R1/(R1 + R2))
print("s1: ", s1)
s2 = dist * (R2/(R1 + R2))
print("s2: ", s2)
bx = aPos + s1
print("bx: ", bx)
