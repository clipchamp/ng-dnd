import {
  getNativeItemType,
  NATIVE_FILE,
  NATIVE_STRING,
  getNativeFiles,
  getNativeStrings
} from './native-file';

describe('getNativeItemType', () => {
  it('should return file type', () => {
    expect(getNativeItemType({ items: [{ kind: 'file' }] } as any)).toBe(NATIVE_FILE);
    expect(getNativeItemType({ files: [{}] } as any)).toBe(NATIVE_FILE);
  });

  it('should return string type', () => {
    expect(getNativeItemType({} as any)).toBe(NATIVE_STRING);
    expect(getNativeItemType({ items: [{ kind: 'text' }] } as any)).toBe(NATIVE_STRING);
    expect(getNativeItemType({ files: [], items: [{ kind: 'text' }] } as any)).toBe(NATIVE_STRING);
  });
});

describe('getNativeFiles', () => {
  it('should extract all files from the data transfer items', () => {
    const fileA = new File(['abc'], 'test.mp4');
    const fileB = new File(['abcd'], 'test2.mp4');
    const dataTransfer = {
      items: [
        { kind: 'file', getAsFile: () => fileA },
        { kind: 'string' },
        { kind: 'file', getAsFile: () => fileB }
      ],
      files: [fileA]
    };
    dataTransfer.items['clear'] = () => {};
    expect(getNativeFiles(dataTransfer as any)).toEqual([fileA, fileB]);
  });

  it('should extract all files from the data transfer files', () => {
    const fileA = new File(['abc'], 'test.mp4');
    const fileB = new File(['abcd'], 'test2.mp4');
    const dataTransfer = {
      files: [fileA, fileB],
      clearData: () => {}
    };
    expect(getNativeFiles(dataTransfer as any)).toEqual([fileA, fileB]);
  });

  it('should not extract any files from the data transfer', () => {
    const dataTransfer = {
      items: [{ kind: 'string' }]
    };
    dataTransfer.items['clear'] = () => {};
    expect(getNativeFiles(dataTransfer as any)).toEqual([]);
  });
});

describe('getNativeStrings', () => {
  it('should extract all strings from the file transfer', (done: any) => {
    const fileA = new File(['abcd'], 'test2.mp4');
    const dataTransfer = {
      items: [
        { kind: 'string', type: 'text/plain', getAsString: (cb: any) => cb('test') },
        { kind: 'string', type: 'text/plain', getAsString: (cb: any) => cb('test2') },
        { kind: 'file', getAsFile: () => fileA }
      ],
      files: [fileA]
    };
    getNativeStrings(dataTransfer as any).then(strings => {
      expect(strings).toEqual(['test', 'test2']);
      done();
    });
  });

  it('should not extract any strings from the file transfer', (done: any) => {
    const dataTransfer = {
      items: [
        { kind: 'string', type: 'text/url', getAsString: (cb: any) => cb('test') },
        { kind: 'string', type: 'text/url', getAsString: (cb: any) => cb('test2') }
      ]
    };
    getNativeStrings(dataTransfer as any).then(strings => {
      expect(strings).toEqual([]);
      done();
    });
  });
});
